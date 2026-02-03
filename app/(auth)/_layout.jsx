import { Redirect, Stack } from "expo-router";


const AuthLayout = () => {


  return (
      <Stack>
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
            animation:'slide_from_left'
            
          }}
        />
        <Stack.Screen
          name="sign-up"
          options={{
            headerShown: false,
            animation:'slide_from_right'
            
          }}
        />
      </Stack>

  );
};

export default AuthLayout;