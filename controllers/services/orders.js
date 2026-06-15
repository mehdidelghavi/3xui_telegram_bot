const prisma = require('../../helpers/prisma');
const functionHelpers = require("../../helpers/functions");
const moment = require("jalali-moment");

exports.getDataTable = async (req) => {
    try {
        const draw = Number(req.query.draw) || 1;
        const length = Number(req.query.length) || 10;
        const start = Number(req.query.start) || 0;

        // 🔥 مهم‌ترین خط
        const search = req.query['search[value]']?.trim() || '';


        // Order
        const orderColumnIndex = req.query['order[0][column]'];
        const orderDir = req.query['order[0][dir]'] || "desc";
        const isDefaultOrder =
            orderColumnIndex === undefined || orderColumnIndex === null;

        // مهم: mapping index → column name
        const columns = [
            'id',
            'user_id',
            'service_id',
            'plan_id',
            'price',
            'status',
            'email',
            'createdAt',
        ];

        const statuses = [
            'RENEW',
            'PURCHASE'
        ];

        const statusLabels = {
            PURCHASE: 'خرید کانفیک',
            RENEW: 'تمدید کانفیگ',
        };

        const statusSearchMap = {
            'تمدید کانفیگ': 'RENEW',
            'خرید کانفیگ': 'PURCHASE',
        };

        const statusValue = statusSearchMap[search];

        const orderColumn = isDefaultOrder
            ? 'id'
            : columns[orderColumnIndex] || 'id';

        const finalOrderDir = isDefaultOrder ? 'desc' : orderDir;

        const where = search
            ? {
                OR: [
                    ...(statusValue ? [{ status: statusValue }] : []),
                    ...(Number.isInteger(Number(search))
                        ? [
                            { price: Number(search) },
                        ]
                        : []),
                    {
                        user: {
                            username: {
                                contains: search,
                            },
                        },
                    },
                    {
                        service: {
                            title: {
                                contains: search,
                            },
                        },
                    },
                    {
                        email: {
                            contains: search
                        },
                    }
                ],
            }
            : {};

        const [data, total, filtered] = await Promise.all([
            prisma.order.findMany({
                where,
                skip: start,
                take: length,
                orderBy: {
                    [orderColumn]: finalOrderDir
                },
                include: {
                    service: true,
                    user: true,
                    plan: true,
                }
            }),
            prisma.order.count(),
            prisma.order.count({ where }),
        ]);

        return {
            draw,
            recordsTotal: total,
            recordsFiltered: filtered,
            data: data.map(u => ([
                Number(u.id),
                `${u.user.username}`,
                `${u.service.title}`,
                `${u.plan.traffic} گیگ ${u.plan.days} روزه`,
                `${functionHelpers.priceFormatte(u.price)} تومان`,
                statusLabels[u.status] || u.status,
                u.email,
                moment(u.createdAt).locale("fa").format("YYYY/MM/DD HH:MM:SS")
            ])),
        };

    } catch (err) {
        console.error(err);
        return {
            error: err.message
        };
    }
}