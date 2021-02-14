import axios from 'axios';

// @TODO - hack for ingress in minkube being a bitch
export default ({ req }, serverUrl) => {
  const options =
    typeof window === 'undefined'
      ? {
          baseURL: serverUrl,
          // "http://ingress-nginx-controller.kube-system.svc.cluster.local", // @TODO fix this
          headers: req.headers,
        }
      : { baseURL: '/' };
  return axios.create(options);
};
