import { Route, Routes, BrowserRouter } from 'react-router-dom';
import React, { Suspense } from 'react';
import Users from './user/pages/Users';
import NewPlace from './places/pages/NewPlace';
import UserPlaces from './places/pages/UserPlaces';
import UpdatePlace from './places/pages/UpdatePlace';
import Auth from './user/pages/Auth';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import { AuthContext } from './shared/context/auth-context';
import { useAuth } from './shared/hooks/auth-hook';
// import LoadingSpinner from './shared/components/UIElements/LoadingSpinner';

// const Users = React.lazy(() => import('./user/pages/Users'));
// const NewPlace = React.lazy(() => import('./places/pages/NewPlace'));
// const UserPlaces = React.lazy(() => import('./places/pages/UserPlaces'));
// const UpdatePlace = React.lazy(() => import('./places/pages/UpdatePlace'));
// const Auth = React.lazy(() => import('./user/pages/Auth'));
// const LoadingSpinner = React.lazy(() =>
//   import('./shared/components/UIElements/LoadingSpinner')
// );
// const MainNavigation = React.lazy(() =>
//   import('./shared/context/auth-context')
// );

const App = () => {
  const { login, logout, token, userId } = useAuth();

  let routes;

  if (token) {
    routes = (
      <Routes>
        <Route path="/" element=<Users /> />
        <Route path="/:userId/places" element=<UserPlaces /> />
        <Route path="/places/new" element=<NewPlace /> />
        <Route path="/places/:placeId" element=<UpdatePlace /> />
        {/* <Navigate to="/" /> */}
      </Routes>
    );
  } else {
    routes = (
      <Routes>
        <Route path="/" element=<Users /> />
        <Route path="/:userId/places" element=<UserPlaces /> />
        <Route path="/auth" element=<Auth /> />
        {/* <Navigate to="/auth" /> */}
      </Routes>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        userId: userId,
        login: login,
        logout: logout,
      }}
    >
      <BrowserRouter>
        <MainNavigation />

        <main>
          {/* <Suspense
            fallback={
              <div className="center">
                <LoadingSpinner />
              </div>
            }
          > */}
          {routes}
          {/* </Suspense> */}
        </main>
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

export default App;
