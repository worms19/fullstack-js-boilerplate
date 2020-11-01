
import { Box, Button, Link } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import React from 'react'
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import {useRouter} from 'next/router'
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import NextLink from 'next/link'

interface registerProps {};


export const Login: React.FC<{}> = ({}) => {
    const router=useRouter();
        const [, login] = useLoginMutation ()
        return (
        <Formik 
            initialValues={{userNameOrEmail: '', password:''}}
            onSubmit={async (values, {setErrors})=>{
                const response = await login(values);
                if(response.data?.login.errors){
                    setErrors(toErrorMap(response.data.login.errors))
                } else if(response.data?.login.user){
                    router.push('/');
                }
            }}
        >
            {({isSubmitting}) =>(
                <Wrapper variant="small">
                    <Form>
                        <InputField 
                            name= "userNameOrEmail"
                            placeholder="username or email"
                            label="username or email"
                        />
                        <Box mt={4}>
                        <InputField 
                            name= "password"
                            placeholder="password"
                            label="password"
                            type="password"
                            />
                        </Box>
                        <Box mt={4}>
                            <NextLink href="/forgot-password">
                            <Link>
                                Password forgotten
                            </Link>
                            </NextLink>
                        </Box>
                        <Button mt={4} isLoading={isSubmitting} type="submit" variantColor="teal"> Login </Button>
                    </Form>
                </Wrapper>
            )}
          </Formik>
        );
}

export default withUrqlClient(createUrqlClient)(Login)