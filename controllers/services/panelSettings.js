const prisma = require("../../helpers/prisma");

exports.editPanelSettings = async () => {
    const getPanelSettings = await prisma.panel_settings.findUnique({
        where: {
            id: 1
        }
    });
    return getPanelSettings;
}

exports.update = async (settingId, data) => {
    return await prisma.panel_settings.update({
        where: { id: Number(settingId) },
        data
    });
}