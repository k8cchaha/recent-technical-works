import { ApolloClient } from "apollo-client";
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloLink, from } from "apollo-link";
import { onError } from "apollo-link-error";

import { Data } from "src/boot/storage.js";
import { getAccessTokenSilentlyPacked } from "src/libs/methods/getAccessTokenSilently";
import { useLoadingStore } from "src/store/loadingStore";
import { Notify } from "quasar";

const localStorageData = new Data();
const SWIFT_URL = process.env.URL_SWIFT_GRAPHQL;
const SWIFT_URL_PUBLIC = process.env.URL_SWIFT_GRAPHQL_PUBLIC;
const AUTH_0_EXP = process.env.AUTH0_EXPIRATION;
const loading = useLoadingStore();

const httpLink = createHttpLink({
  uri: SWIFT_URL,
  credentials: "include",
});

const httpPublicLink = createHttpLink({
  uri: SWIFT_URL_PUBLIC,
  credentials: "include",
});

async function updatedToken() {
  const now = Date.now();
  if (
    localStorageData.currentAccessToken()?.token == undefined ||
    localStorageData.currentAccessToken()?.time + AUTH_0_EXP < now
  ) {
    const newToken = await getAccessTokenSilentlyPacked();
    const newAccessToken = {
      token: newToken,
      time: now,
    };
    localStorageData.saveAccessToken(newAccessToken);
  }
}

export const client = function (config) {
  const isAuth = config?.hasOwnProperty("isAuth") ? config.isAuth : true;
  const isOrgId = config?.hasOwnProperty("isOrgId") ? config.isOrgId : true;
  const isTeamId = config?.hasOwnProperty("isTeamId") ? config.isTeamId : true;
  const isMute = config?.hasOwnProperty("isMute") ? config.isMute : false;
  const isPublic = config?.hasOwnProperty("isPublic") ? config.isPublic : false;
  const isEmployee = config?.hasOwnProperty("isEmployee")
    ? config.isEmployee
    : false;
  const loadingMsg = config?.hasOwnProperty("loadingMsg")
    ? config.loadingMsg
    : false;
  const loadingMsgOpt = config?.hasOwnProperty("loadingMsgOpt")
    ? config.loadingMsgOpt
    : null;
  const isManuallyLoading = config?.hasOwnProperty("isManuallyLoading")
    ? config.isManuallyLoading
    : false;
  const isAutoErrorHandle = config?.hasOwnProperty("isAutoErrorHandle")
    ? config.isAutoErrorHandle
    : false;
  const customHeader = config?.headers || {};
  const successMsg = config?.successMsg || "";
  const headers = {};
  const linkChain = [];

  const authLink = new ApolloLink((operation, forward) => {
    if (isAuth) {
      updatedToken();
      headers["Authorization"] =
        `Bearer ${localStorageData.currentAccessToken()?.token}` || null;
    }
    operation.setContext({
      headers: Object.assign(headers),
    });

    return forward(operation);
  });

  const customReqLink = new ApolloLink((operation, forward) => {
    if (isTeamId) {
      headers["Team-ID"] = localStorageData.selectedTeam()?.id || null;
    }
    if (isOrgId) {
      headers["Organization-ID"] =
        localStorageData.currentUser()?.organizations?.[0]?.id.trim() || null;
    }
    if (isEmployee) {
      headers["employee-view"] = true || null;
    }
    operation.setContext({
      headers: Object.assign(headers, customHeader),
    });

    return forward(operation);
  });

  const middlewareLink = new ApolloLink((operation, forward) => {
    if (!isMute && !isManuallyLoading) {
      if (!!loadingMsg) {
        loading.showWithMsg(loadingMsg, loadingMsgOpt);
      } else {
        loading.show();
      }
    }

    return forward(operation).map((response) => {
      if (!isMute) {
        if (!isManuallyLoading) {
          loading.hide();
        }

        if (response.errors && response.errors.length > 0) {
          for (const error of response.errors) {
            if (error.friendlyMessage) {
              Notify.create({
                type: error.type === "api_error" ? "st-error" : "st-warning",
                message: error.friendlyMessage,
              });
            }
          }
        } else {
          if (successMsg) {
            Notify.create({
              type: "st-success",
              message: successMsg,
            });
          }
        }
      }
      return response;
    });
  });

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (!isMute) {
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) => {
          if (isAutoErrorHandle) {
            Notify.create({
              type: "st-unknown-error",
            });
          } else {
            console.log(
              `[GraphQL Error]: Message: ${message}, Location: ${locations}, Path: ${path}`
            );
          }
        });
      }

      if (networkError) {
        if (!isManuallyLoading) {
          loading.hide();
        }

        Notify.create({
          type: "st-error",
          message: `[Network Error]: ${networkError}`,
        });
      }
    }
  });

  if (isAuth) {
    linkChain.push(authLink);
  }

  linkChain.push(errorLink);
  linkChain.push(middlewareLink);
  linkChain.push(customReqLink);
  
  if (isPublic) {
    linkChain.push(httpPublicLink);
  } else {
    linkChain.push(httpLink);
  }

  return new ApolloClient({
    link: from(linkChain),
    cache: new InMemoryCache(),
  });
};
