const authService = require("../../services/auth/auth");

exports.getLogin = (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }

    return res.render("login");
}

exports.postLogin = async (req, res) => {
    const data = {
        username: req.body.username,
        password: req.body.password
    }
    const checkIsValid = await authService.postLogin(data);
    if (checkIsValid.success) {
        const user = checkIsValid.obj;
        req.session.user = {
            id: user.id.toString(),
            username: user.username
        };
        await req.session.save(() => {
            return res.redirect('/dashboard');
        });
    } else {
        req.flash("failed", checkIsValid.message);
        return res.redirect("/login");
    }

}