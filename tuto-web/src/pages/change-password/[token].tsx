import { Box, Button, Link } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { toErrorMap } from '../../utils/toErrorMap';
import  NextLink from 'next/link'
import { NextPage } from 'next';


 const ChangePassword: NextPage = ({}) => {
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState("");
  console.log(router);

    return (
   <Wrapper variant="regular">

    <Formik 
            initialValues={{newPassword: '', }}
            onSubmit={async (values, {setErrors})=>{
              const response = await changePassword({
                newPassword: values.newPassword,
                token: typeof router.query.token === "string" ? router.query.token : ""});
              if(response.data?.ChangePassword.errors){
                const errorMap = toErrorMap(response.data.ChangePassword.errors);
                if('token' in errorMap){
                  setTokenError(errorMap.token)
                }
                setErrors(errorMap);

              } else if(response.data?.ChangePassword.user){
                router.push('/');
              }
            }}
            >
            {({isSubmitting}) =>(
              <Wrapper variant="small">
                    <Form>
                        <InputField 
                            name= "newPassword"
                            placeholder="newPassword"
                            label="newPassword"
                            type="password"
                            />
                 
                    {tokenError && 
                    <>
                    <Box color="red">{tokenError}</Box>
                    <NextLink href="/forgot-password">
                      <Link>
                      click here to get a new one
                      </Link>
                    </NextLink>
                    </>
                    }
                          <Button mt={4} isLoading={isSubmitting} type="submit" variantColor="teal"> update Password </Button>
                    </Form>
                </Wrapper>
            )}
          </Formik>
            </Wrapper>
       
    );
};


export default withUrqlClient(createUrqlClient)(ChangePassword);