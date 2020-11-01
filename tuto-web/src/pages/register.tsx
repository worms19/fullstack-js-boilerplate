
import { Box, Button } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useRegisterMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { toErrorMap } from '../utils/toErrorMap';

interface registerProps {};


export const Register: React.FC<registerProps> = () => {
    const router=useRouter();
        const [,register] = useRegisterMutation ()
        return (
        <Formik 
            initialValues={{username: '', password:'', email:''}}
            onSubmit={async (values, {setErrors})=>{
                const response = await register({ options : values});
                if(response.data?.register.errors){
                    setErrors(toErrorMap(response.data.register.errors))
                } else if(response.data?.register.user){
                    router.push('/');
                }
            }}
        >
            {({isSubmitting}) =>(
                <Wrapper variant="small">
                    <Form>
                        <InputField 
                            name= "username"
                            placeholder="username"
                            label="username"
                        />
                        <Box mt={4}>
                        <InputField 
                            name= "password"
                            placeholder="password"
                            label="password"
                            type="password"
                            />
                        </Box>
                        <InputField 
                            name= "email"
                            placeholder="email"
                            label="email"
                        />
                        <Button mt={4} isLoading={isSubmitting} type="submit" variantColor="teal"> Register </Button>
                    </Form>
                </Wrapper>
            )}
          </Formik>
        );
}

export default withUrqlClient(createUrqlClient)(Register)