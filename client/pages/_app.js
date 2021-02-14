import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <div className='container'>
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </div>
  );
};

AppComponent.getInitialProps = async ({ Component, ctx }) => {
  let currentUser;
  const client = buildClient(ctx, 'http://auth-svc:3000');
  try {
    const response = await client.get('/api/users/currentuser');
    currentUser = response.data.currentUser;
  } catch (err) {
    currentUser = null;
  }

  let pageProps = {};

  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx, client, currentUser);
  }
  return {
    pageProps,
    currentUser,
  };
};

export default AppComponent;
