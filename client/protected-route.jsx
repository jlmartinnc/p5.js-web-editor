import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getIsUserOwner } from './modules/IDE/selectors/users';

// eslint-disable-next-line react/prop-types
const ProtectedSketchRoute = ({ component: Component, ...rest }) => {
  const project = useSelector((state) => state.project);
  const isUserOwner = useSelector(getIsUserOwner);

  console.log(project.id);
  return (
    <Route
      {...rest}
      render={(props) => {
        // Allow access if user is owner or sketch is public
        if (isUserOwner || project.visibility !== 'Private') {
          return <Component {...props} />;
        }

        // Redirect if not so
        return (
          <Redirect
            to={{
              pathname: '/'
            }}
          />
        );
      }}
    />
  );
};

export default ProtectedSketchRoute;
