import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <Component {...pageProps} />
    </div>
  );
};

AppComponent.getInitialProps = async ({ Component, ctx }) => {
  let currentUser;
  try {
    const response = await buildClient(ctx).get('/api/users/currentuser');
    currentUser = response.data.currentUser;
  } catch (err) {
    currentUser = null;
  }

  let pageProps = {};

  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }
  return {
    pageProps,
    currentUser,
  };
};

export default AppComponent;
