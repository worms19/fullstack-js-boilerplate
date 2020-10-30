
import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import React from 'react'
import { useMutation } from 'urql';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useRegisterMutation } from '../generated/graphql';

interface registerProps {};


export const Register: React.FC<registerProps> = ({}) => {
        const [,register] = useRegisterMutation ()
        return (
        <Formik 
            initialValues={{username: '', password:''}}
            onSubmit={async (values, {setErrors})=>{
                console.log(values)
                const response = await register(values);
                if(response.data?.register.errors){
                    setErrors({
                        username: "hey i'm an error"
                    })
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
                            name= "pasword"
                            placeholder="password"
                            label="password"
                            type="password"
                            />
                        </Box>
                        <Button mt={4} isLoading={isSubmitting} type="submit" variantColor="teal"> Register </Button>
                    </Form>
                </Wrapper>
            )}
          </Formik>
        );
}

export default Register