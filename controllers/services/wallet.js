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
            'amount',
            'type',
            'description',
            'createdAt',
        ];


        const statusLabels = {
            PURCHASE: 'کسر ولت',
            DEPOSIT: 'شارژ ولت',
            REFUND: 'هدیه ولت',
        };

        const statusSearchMap = {
            'شارژ ولت': 'DEPOSIT',
            'خرید': 'PURCHASE',
            'هدیه ولت': 'REFUND',
        };

        const statusValue = statusSearchMap[search];

        const orderColumn = isDefaultOrder
            ? 'id'
            : columns[orderColumnIndex] || 'id';

        const finalOrderDir = isDefaultOrder ? 'desc' : orderDir;

        const where = search
            ? {
                OR: [
                    ...(statusValue ? [{ type: statusValue }] : []),
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
                        description: {
                            contains: search
                        },
                    }
                ],
            }
            : {};

        const [data, total, filtered] = await Promise.all([
            prisma.wallet_transaction.findMany({
                where,
                skip: start,
                take: length,
                orderBy: {
                    [orderColumn]: finalOrderDir
                },
                include: {
                    user: true,
                }
            }),
            prisma.wallet_transaction.count(),
            prisma.wallet_transaction.count({ where }),
        ]);

        return {
            draw,
            recordsTotal: total,
            recordsFiltered: filtered,
            data: data.map(u => ([
                Number(u.id),
                `${u.user.username}`,
                `${functionHelpers.priceFormatte(u.amount)} تومان`,
                statusLabels[u.type] || u.type,
                u.description,
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