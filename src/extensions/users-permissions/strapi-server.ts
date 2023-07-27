import {BuyerClass} from "./common/buyer.class";

module.exports = (plugin) => {
  plugin.controllers.user.buyerRegister = async (ctx) => {
    await BuyerClass.register(ctx);
  }

  plugin.controllers.user.buyerLogin = async (ctx) => {
    await BuyerClass.login(ctx);
  }

  plugin.routes['content-api'].routes.push(
    {
    "method": "POST",
    "path": "/buyer-register",
    "handler": "user.buyerRegister"
    },
    {
      "method": "POST",
      "path": "/buyer-login",
      "handler": "user.buyerLogin"
    })

  return plugin
}
