import { Box, Button } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import React, { useState } from 'react'
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useForgotPasswordMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';


const ForgotPassword: React.FC<{}> = ({}) => {

    const [complete, setComplete] = useState(false);
    const [, forgotPassword] = useForgotPasswordMutation();
    return (
      <Formik 
      initialValues={{email: ''}}
      onSubmit={async (values, {setErrors})=>{
          const response = await forgotPassword(values);
            setComplete(true)
      }}
  >
      {({isSubmitting}) =>complete ? <Box>an email has been sent to reset your password</Box> :(
          <Wrapper variant="small">
              <Form>
                  <InputField 
                      name= "email"
                      placeholder="email"
                      label="email"
                      type="email"
                  />
                  <Button mt={4} isLoading={isSubmitting} type="submit" variantColor="teal"> Forgot password </Button>
              </Form>
          </Wrapper>
      )}
    </Formik>
    );
}

export default ForgotPassword;