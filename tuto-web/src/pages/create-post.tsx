import { Box, Button } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import React from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useCreatePostMutation } from '../generated/graphql';
import { useRouter } from 'next/router';
import { createUrqlClient } from '../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';

const CreatePost: React.FC<{}> = ({}) => {
    const [, createPost] = useCreatePostMutation()
    const router = useRouter()
    return (
      <Wrapper variant="small">
        <Formik 
            initialValues={{title: '', text:''}}
            onSubmit={async (values, )=>{
               await createPost({ input: values})
               router.push('/')
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
      </Wrapper>
    );
}

export default withUrqlClient(createUrqlClient)(CreatePost)