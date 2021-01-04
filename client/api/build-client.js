import axios from 'axios';

export default ({ req }) => {
  const options =
    typeof window === 'undefined'
      ? {
          baseURL:
            'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
          headers: req.headers,
        }
      : { baseURL: '/' };
  return axios.create(options);
};
