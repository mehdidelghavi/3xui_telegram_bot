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
            'method_id',
            'amount',
            'status',
            'trackingCode',
            'createdAt',
        ];

        const statuses = [
            'PENDING',
            'WAITING_CONFIRMATION',
            'SUCCESS',
            'FAILED',
            'EXPIRED'
        ];

        const statusLabels = {
            PENDING: 'در انتظار پرداخت',
            WAITING_CONFIRMATION: 'در انتظار تایید',
            SUCCESS: 'پرداخت موفق',
            FAILED: 'پرداخت ناموفق',
            EXPIRED: 'منقضی شده'
        };

        const statusSearchMap = {
            'در انتظار پرداخت': 'PENDING',
            'در انتظار تایید': 'WAITING_CONFIRMATION',
            'پرداخت موفق': 'SUCCESS',
            'پرداخت ناموفق': 'FAILED',
            'منقضی شده': 'EXPIRED'
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
                            { amount: Number(search) },
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
                        method: {
                            name: {
                                contains: search,
                            },
                        },
                    },
                    {
                        trackingCode: {
                            contains: search
                        },
                    }
                ],
            }
            : {};

        const [data, total, filtered] = await Promise.all([
            prisma.payment.findMany({
                where,
                skip: start,
                take: length,
                orderBy: {
                    [orderColumn]: finalOrderDir
                },
                include: {
                    method: true,
                    user: true
                }
            }),
            prisma.payment.count(),
            prisma.payment.count({ where }),
        ]);

        return {
            draw,
            recordsTotal: total,
            recordsFiltered: filtered,
            data: data.map(u => ([
                Number(u.id),
                `${u.user.username}`,
                `${u.method.name}`,
                `${functionHelpers.priceFormatte(u.amount)} تومان`,
                statusLabels[u.status] || u.status,
                u.trackingCode,
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