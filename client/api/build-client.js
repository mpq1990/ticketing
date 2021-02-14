import axios from 'axios';

export default ({ req }) => {
  const options =
    typeof window === 'undefined'
      ? {
          baseURL: 'http://auth-svc:3000',
          // "http://ingress-nginx-controller.kube-system.svc.cluster.local", // @TODO fix this
          headers: req.headers,
        }
      : { baseURL: '/' };
  return axios.create(options);
};
