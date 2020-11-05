import { Box, Button } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import React, { useEffect } from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useCreatePostMutation, useMeQuery } from '../generated/graphql';
import { useRouter } from 'next/router';
import { createUrqlClient } from '../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';
import Layout from './Layout';
import { useIsAuth } from '../utils/useIsAuth';

const CreatePost: React.FC<{}> = ({}) => {
    const router = useRouter()
    useIsAuth();     
    const [, createPost] = useCreatePostMutation()
    return (
      <Layout variant="small">
        <Formik 
            initialValues={{title: '', text:''}}
            onSubmit={async (values, )=>{
              const {error} = await createPost({ input: values})
              if(!error){
                router.push('/')
              }
            }}
            >
            {({isSubmitting}) =>(
              <Wrapper variant="small">
                    <Form>
                        <InputField 
                            name= "title"
                            placeholder="title"
                            label="title"
                            />
                        <Box mt={4}>
                        <InputField 
                            textarea
                            name= "text"
                            placeholder="text..."
                            label="body"
                            />
                        </Box>
                        
                        <Button mt={4} isLoading={isSubmitting} type="submit" variantColor="teal"> Create Post </Button>
                    </Form>
                </Wrapper>
            )}
          </Formik>
            </Layout>
    );
}

export default withUrqlClient(createUrqlClient)(CreatePost)