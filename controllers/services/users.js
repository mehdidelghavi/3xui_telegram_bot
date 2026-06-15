const { UserRole } = require('@prisma/client');
const prisma = require('../../helpers/prisma');

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
            'fullname',
            'username',
            'chat_id',
            'role',
            'createdAt',
            'actions'
        ];

        const orderColumn = isDefaultOrder
            ? 'id'
            : columns[orderColumnIndex] || 'id';

        const finalOrderDir = isDefaultOrder ? 'desc' : orderDir;

        const where = search
            ? {
                OR: [
                    {
                        fullname: {
                            contains: search
                        },
                    },
                    {
                        username: {
                            contains: search
                        },
                    },
                    ...(Object.values(UserRole).includes(search.toUpperCase())
                        ? [{
                            role: search.toUpperCase()
                        }]
                        : []),
                    ...(isNaN(search) ? [] : [{ chat_id: Number(search) }])
                ],
            }
            : {};

        const [data, total, filtered] = await Promise.all([
            prisma.user.findMany({
                where,
                skip: start,
                take: length,
                orderBy: {
                    [orderColumn]: finalOrderDir
                }
            }),
            prisma.user.count(),
            prisma.user.count({ where }),
        ]);

        return {
            draw,
            recordsTotal: total,
            recordsFiltered: filtered,
            data: data.map(u => ([
                Number(u.id),
                u.fullname || '-',
                u.username || '-',
                Number(u.chat_id),
                u.role,
                u.createdAt
                    ? new Date(u.createdAt).toLocaleString('fa-IR')
                    : '-',
                `<div class="flex gap-2">

                    <a href="/users/edit/${u.id}"
                    class="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-lg transition">
                    
                        <svg viewBox="64 64 896 896" focusable="false" data-icon="edit" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M257.7 752c2 0 4-.2 6-.5L431.9 722c2-.4 3.9-1.3 5.3-2.8l423.9-423.9a9.96 9.96 0 000-14.1L694.9 114.9c-1.9-1.9-4.4-2.9-7.1-2.9s-5.2 1-7.1 2.9L256.8 538.8c-1.5 1.5-2.4 3.3-2.8 5.3l-29.5 168.2a33.5 33.5 0 009.4 29.8c6.6 6.4 14.9 9.9 23.8 9.9zm67.4-174.4L687.8 215l73.3 73.3-362.7 362.6-88.9 15.7 15.6-89zM880 836H144c-17.7 0-32 14.3-32 32v36c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-36c0-17.7-14.3-32-32-32z"></path></svg>

                    </a>

                </div>`
            ])),
        };

    } catch (err) {
        console.error(err);
        return {
            error: err.message
        };
    }
}

exports.getUserById = async (userId) => {
    try {
        const getUserById = await prisma.user.findFirst({
            where: {
                id: Number(userId)
            }
        });
        return {
            success: true,
            message: "کاربر با موفقیت یافت شد",
            obj: getUserById
        }
    } catch (e) {
        return {
            success: false,
            message: e.message
        }
    }
}

exports.updateUserById = async (userId, data) => {
    try {
        const updateUser = await prisma.user.update({
            data: {
                role: data.role
            },
            where: {
                id: Number(userId)
            }
        });
        return {
            success: true,
            message: "کاربر با موفقیت ویرایش شد",
            obj: updateUser
        }
    } catch (e) {
        return {
            success: false,
            message: e.message
        }
    }
}