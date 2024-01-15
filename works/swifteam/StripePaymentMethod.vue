<template>
  <q-card class="bg-white">
    <q-card-section>
      <div class="row reverse">
        <q-icon
          size="25px"
          @click="emitPaymentDlgClose"
          style="cursor: pointer"
        >
          <img src="~assets/icons/close.png" />
        </q-icon>
      </div>

      <div style="margin: 0 40px">
        <div style="margin-bottom: 15px">
          <span style="color: #0db14b; font-weight: 900; font-size: 16px"
            >Add payment method</span
          >
        </div>
        <div class="payment-form">
          <div id="payment-element">
            <!-- Stripe Elements will create form elements here -->
          </div>
        </div>
        <div style="margin: 40px 0 20px">
          <div class="row justify-between" style="margin-bottom: 20px">
            <q-btn
              outline
              no-caps
              color="primary"
              size="md"
              label="Cancel"
              style="margin-right: 20px"
              @click="emitPaymentDlgClose"
            />
            <q-btn
              color="primary"
              unelevated
              no-caps
              size="md"
              label="Add payment method"
              @click="addPayment"
            />
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>
<script>
import billingApi from "src/libs/api/billingApi";
import { client } from "src/libs/methods/apolloClient";
import { useLoadingStore } from "src/store/loadingStore";
import { loadScript } from "src/libs/methods/utils";

export default {
  name: "StripePaymentMethod",
  props: {
    customerId: {
      type: String,
      default: "",
    },
    customHeader: {
      type: Object,
      default: function () {
        return {};
      },
    },
  },
  data() {
    return {
      stripe: null,
      elements: null,
      errorMsg: "",
      clientSecret: "",
      supportedPaymentTypes: ["card", "us_bank_account"],
      loading: useLoadingStore(),
    };
  },
  methods: {
    emitPaymentDlgClose() {
      this.$emit("emitPaymentDlgClose");
    },
    createStripeSetupIntent() {
      client({ headers: this.customHeader })
        .mutate({
          mutation: billingApi.createStripeSetupIntent,
          variables: {
            createStripeSetupIntentInput: {
              customerId: this.customerId,
              paymentMethodTypes: this.supportedPaymentTypes,
            },
          },
        })
        .then((res) => {
          if (res?.data?.createStripeSetupIntent) {
            this.clientSecret = res.data.createStripeSetupIntent.clientSecret;
            this.doInitStripeElement();
          }
        })
        .catch((err) => {
          console.log(JSON.stringify(err));
        });
    },
    checkStripe() {
      if (window.Stripe === undefined) {
        loadScript("https://js.stripe.com/v3/")
          .then(() => {
            if (window.Stripe === undefined) {
              console.error("Load Stripe Fail");
            } else {
              this.createStripeSetupIntent();
            }
          })
          .catch(() => {
            this.$q.notify({
              type: "st-error",
              message: `Currently paid service is temporarily unavailable, please try again later.`,
            });
            this.$emit("emitPaymentDlgClose");
          });
      } else {
        this.createStripeSetupIntent();
      }
    },
    addPayment() {
      this.loading.show();

      this.stripe
        .confirmSetup({
          //`Elements` instance that was used to create the Payment Element
          elements: this.elements,
          redirect: "if_required",
        })
        .then(async (data) => {
          if (data.error) {
            console.log(JSON.stringify(data.error.message));
          } else {
            this.$emit("addStripePMSuccess");
            this.$emit("emitPaymentDlgClose");
            this.$q.notify({
              type: "st-success",
              message: "Add Successfully",
            });
          }
        })
        .catch((err) => {
          this.$q.notify({
            type: "st-error",
            message: JSON.stringify(err),
          });
        })
        .finally(() => {
          this.loading.hide();
        });
    },
    doInitStripeElement() {
      const publicKey = process.env.STRIPE_PK;
      this.stripe = window.Stripe(publicKey);

      const options = {
        clientSecret: this.clientSecret,
        appearance: {
          theme: "stripe",
          rules: {
            ".Tab:focus": {
              borderColor: "#0db14b",
              boxShadow: "none",
            },
            ".Input:focus": {
              borderColor: "#0db14b",
              boxShadow: "none",
            },
          },
        },
      };

      this.elements = this.stripe.elements(options);
      const paymentElement = this.elements.create("payment");
      paymentElement.mount("#payment-element");
    },
  },
  created() {
    this.checkStripe();
  },
};
</script>
<style lang="scss" scoped>
// omitted
</style>
