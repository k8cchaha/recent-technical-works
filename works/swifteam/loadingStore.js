import { defineStore } from "pinia";
import { Loading } from "quasar";
import { QSpinnerHourglass } from "quasar";

export const useLoadingStore = defineStore("loading", {
  state: () => ({
    count: 0,
  }),

  actions: {
    show() {
      if (this.count === 0) {
        Loading.show();
      }
      this.count++;
    },
    showWithMsg(msg, opt) {
      if (this.count === 0) {
        const param = {
          message: msg,
          backgroundColor: "grey",
          spinner: QSpinnerHourglass,
          spinnerColor: "primary",
        };
        if (opt) {
          Object.assign(param, opt);
        }

        Loading.show(param);
      }
      this.count++;
    },
    hide() {
      if (this.count > 0) {
        this.count--;
      } else {
        console.log("Something Wrong");
      }

      if (this.count === 0) {
        setTimeout(() => {
          if (this.count === 0) {
            Loading.hide();
          }
        }, 500);
      }
    },
  },
});
