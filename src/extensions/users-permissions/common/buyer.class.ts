export class BuyerClass {
  public static async register(ctx: any) {
    const { username, password, email } = ctx.request.body;
    const userWithSameUsername = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { username },
      });

    if (userWithSameUsername) {
      return ctx.badRequest(null, [
        { messages: [{ id: "Auth.form.error.username.taken" }] },
      ]);
    }

    const userService = strapi.plugin("users-permissions").services.user;
    const jwt = strapi.plugin("users-permissions").services.jwt;

    const user = await userService.add({
      username,
      email,
      password,
      confirmed: true,
      blocked: false,
      role: 3,
      provider: "google",
    });

    const token = jwt.issue({ id: user.id });
    ctx.response.body = {
      data: {
        jwt: token,
        user,
      },
    };
  }

  public static async login(ctx: any) {
    const { email } = ctx.request.body;
    const jwt = strapi.plugin("users-permissions").services.jwt;
    /**
     * if email found -> return user and jwt
     * */
    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { email },
      });

    if (!user)
      return ctx.badRequest(null, [
        { messages: [{ id: "Auth.form.error.username.taken" }] },
      ]);

    const token = jwt.issue({ id: user.id });
    ctx.response.body = {
      data: {
        jwt: token,
        user,
      },
    };
  }
}
