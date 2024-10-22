import { SERVER_URL } from "@/config";

import URL from "@/constants/url";
import CODE from "@/constants/code";

interface RequestOptions {
  method: string;
  headers: { [key: string]: string };
  body?: string;
  origin?: string;
  credentials?: RequestCredentials;
}

interface ResponseData {
  resultCode: string;
  resultMessage?: string;
}

export function requestFetch(
  url: string,
  requestOptions: RequestOptions,
  handler: (resp: ResponseData) => void,
  errorHandler?: (error: Error) => void
): void {
  console.groupCollapsed("requestFetch");
  console.log("requestFetch [URL] : ", SERVER_URL + url);
  console.log("requestFetch [requestOption] : ", requestOptions);

  //CORS ISSUE 로 인한 조치 - origin 및 credentials 추가
  // origin 추가
  if (!requestOptions["origin"]) {
    requestOptions = { ...requestOptions, origin: SERVER_URL };
  }
  // credentials 추가
  if (!requestOptions["credentials"]) {
    requestOptions = { ...requestOptions, credentials: "include" };
  }

  fetch(SERVER_URL + url, requestOptions)
    .then((response) => {
      return response.json() as Promise<ResponseData>;
    })
    .then((resp: ResponseData | false) => {
      if (resp && Number(resp.resultCode) === Number(CODE.RCV_ERROR_AUTH)) {
        alert("Login Alert"); //index.jsx라우터파일에 jwtAuthentication 함수로 공통 인증을 사용하는 코드 추가로 alert 원상복구
        sessionStorage.setItem("loginUser", JSON.stringify({ id: "" }));
        window.location.href = URL.LOGIN;
        return false;
      } else {
        return resp;
      }
    })
    .then((resp) => {
      if (resp !== false) {
        console.groupCollapsed("requestFetch.then()");
        console.log("requestFetch [response] ", resp);
        if (typeof handler === "function") {
          handler(resp);
        } else {
          console.log("egov fetch handler not assigned!");
        }
        console.groupEnd();
      }
    })
    .catch((error) => {
      console.error("There was an error!", error);
      if (error.message === "Failed to fetch") {
        alert("서버와의 연결이 원활하지 않습니다. 서버를 확인하세요.");
      }

      if (typeof errorHandler === "function") {
        errorHandler(error);
      } else {
        console.error("egov error handler not assigned!");
        alert("ERR : " + error.message);
      }
    })
    .finally(() => {
      console.log("requestFetch finally end");
      console.groupEnd();
    });
}