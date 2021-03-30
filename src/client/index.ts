import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { redactNricfinInString } from "../util/RedactorUtil";

export const createClient = (requestConfig: AxiosRequestConfig = {}): AxiosInstance => {
	// Note: Due to axios not being able to automatically pick up proxy env vars, we have to manually define a custom proxy agent
	// Axios 0.19.0 has not fixed this issue yet, so we are using this workaround: https://github.com/axios/axios/issues/925#issuecomment-419352052
	const proxyConfig = getProxyConfig();
	if (!!proxyConfig) {
		requestConfig = {
			proxy: false,
			...requestConfig,
		};
	}

	const instance = axios.create({
		...requestConfig,
	});

	addRequestLogs(instance);
	addResponseLogs(instance);
	return instance;
};

const getProxyConfig = (): string => {
	return process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;
};

const addRequestLogs = (instance: AxiosInstance) => {
	instance.interceptors.request.use((request) => {
		if (!!request) {
			log(`Requesting ${request.method} : ${redactNricfinInString(request.url)}`);
		}
		return request;
	}, (error) => {
		log(`Error occurred while making a request ${error.message}`, error);
		return Promise.reject(error);
	});
};

const addResponseLogs = (instance: AxiosInstance) => {
	instance.interceptors.response.use((response) => {
		if (!!response) {
			log(`Responded ${response.config.method}  : ${redactNricfinInString(response.config.url)}`);
		}
		return response;
	}, (error) => {
		if (!!error.response) {
			log(`Error occurred while responding to request ${error.response.config.method} :
			${redactNricfinInString(error.response.config.url)}`, error);
		} else {
			log(`Error occurred while responding to request`, error);
		}
		return Promise.reject(error);
	});
};

const log = (message?: any, ...optionalParams: any[]) => {
	// tslint:disable-next-line:no-console
	console.log(message, optionalParams);
};
