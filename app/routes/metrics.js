import CheckSessionRoute from "./check-session-route";
import ENV from "pass-ember/config/environment";
import { inject as service } from "@ember/service";

export default class DashboardRoute extends CheckSessionRoute {
  @service("current-user") currentUser;

  async model() {
    const url = `${ENV.fedora.elasticsearch}`;
    console.log(url);
    await fetch(url, { method: "POST" })
      .then((res) => res)
      .then((data) => console.log(data))
      .catch((err) => err);
  }
}
