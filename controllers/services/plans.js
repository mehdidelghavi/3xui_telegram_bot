const prisma = require('../../helpers/prisma');
const functionHelpers = require("../../helpers/functions");

exports.getPlanById = async (planId) => {
    try {
        const getPlanById = await prisma.plan.findFirst({
            where: {
                id: Number(planId)
            },
            include: {
                services: {
                    include: {
                        service: true
                    }
                }
            }
        });
        return {
            success: true,
            message: "تعرفه با موفقیت یافت شد",
            obj: getPlanById
        }
    } catch (e) {
        return {
            success: false,
            message: "متاسفانه تعرفه یافت نشد"
        }
    }
}

exports.getPlans = async () => {
    try {
        const getServers = await prisma.servers.findMany();
        return {
            success: true,
            message: "سرور با موفقیت یافت شد",
            obj: getServers
        }
    } catch (e) {
        return {
            success: false``,
            message: e.message
        }
    }
}

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
            'traffic',
            'days',
            'price',
            'services',
        ];

        const orderColumn = isDefaultOrder
            ? 'id'
            : columns[orderColumnIndex] || 'id';

        const finalOrderDir = isDefaultOrder ? 'desc' : orderDir;

        const where = search
            ? {
                OR: [
                    {
                        traffic: {
                            contains: search
                        },
                    },
                    {
                        days: {
                            contains: search
                        },
                    },
                    {
                        price: {
                            contains: search
                        },
                    }
                ],
            }
            : {};

        const [data, total, filtered] = await Promise.all([
            prisma.plan.findMany({
                where,
                skip: start,
                take: length,
                orderBy: {
                    [orderColumn]: finalOrderDir
                },
                include: {
                    services: {
                        include: {
                            service: true
                        }
                    }
                }
            }),
            prisma.plan.count(),
            prisma.plan.count({ where }),
        ]);

        return {
            draw,
            recordsTotal: total,
            recordsFiltered: filtered,
            data: data.map(u => ([
                Number(u.id),
                `${u.traffic} GB`,
                `${u.days} روزه`,
                `${functionHelpers.priceFormatte(u.price)} تومان`,
                u.services
                    .map(item => item.service.title)
                    .join('، '),
                `<div class="flex gap-2">

                    <a href="/plans/edit/${u.id}"
                    class="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-lg transition">
                    
                        <svg viewBox="64 64 896 896" focusable="false" data-icon="edit" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M257.7 752c2 0 4-.2 6-.5L431.9 722c2-.4 3.9-1.3 5.3-2.8l423.9-423.9a9.96 9.96 0 000-14.1L694.9 114.9c-1.9-1.9-4.4-2.9-7.1-2.9s-5.2 1-7.1 2.9L256.8 538.8c-1.5 1.5-2.4 3.3-2.8 5.3l-29.5 168.2a33.5 33.5 0 009.4 29.8c6.6 6.4 14.9 9.9 23.8 9.9zm67.4-174.4L687.8 215l73.3 73.3-362.7 362.6-88.9 15.7 15.6-89zM880 836H144c-17.7 0-32 14.3-32 32v36c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-36c0-17.7-14.3-32-32-32z"></path></svg>

                    </a>

                    <a href="/plans/delete/${u.id}"
                    onclick="return confirm('حذف شود؟')"
                    class="inline-flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition">

                        <svg viewBox="64 64 896 896" focusable="false" data-icon="delete" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z"></path></svg>

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

exports.saveToDb = async (data) => {
    try {
        const saveToDb = await prisma.plan.create({
            data: {
                traffic: data.traffic,
                days: data.days,
                price: data.price,
                services: {
                    create: data.services.map(serviceId => ({
                        serviceId: BigInt(serviceId)
                    }))
                }
            },
        });
        return {
            success: true,
            message: "تعرفه با موفقیت ثبت شد",
            obj: saveToDb
        }
    } catch (e) {
        return {
            success: false,
            message: e.message
        };
    }
}

exports.updatePlanById = async (planId, data) => {
    try {
        const updatePlan = await prisma.plan.update({
            data: {
                traffic: data.traffic,
                days: data.days,
                price: data.price,
                services: {
                    deleteMany: {},
                    create: data.services.map(serviceId => ({
                        serviceId: BigInt(serviceId)
                    }))
                }
            },
            where: {
                id: Number(planId)
            }
        });
        return {
            success: true,
            message: "تعرفه با موفقیت ویرایش شد",
            obj: updatePlan
        }
    } catch (e) {
        return {
            success: false,
            message: e.message
        };
    }
}

exports.deletePlanById = async (planId) => {
    try {
        const deletePlan = await prisma.$transaction([
            prisma.servicesOnPlans.deleteMany({
                where: {
                    planId: Number(planId)
                }
            }),
            prisma.plan.delete({
                where: {
                    id: Number(planId)
                }
            })
        ]);
        return {
            success: true,
            message: "تعرفه با موفقیت حذف شد"
        }
    } catch (e) {
        return {
            success: false,
            message: e.message
        }
    }
}