import { Box, Button } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../../../components/InputField";
import { Wrapper } from "../../../components/Wrapper";
import {
  usePostQuery,
  useUpdatePostMutation,
} from "../../../generated/graphql";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { useGetIntId } from "../../../utils/useGetIntId";
import Layout from "../../Layout";

const EditPost = ({}) => {
  const router = useRouter();
  const intId = useGetIntId();
  const [{ data, fetching }] = usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId,
    },
  });
  const [, updatePost] = useUpdatePostMutation();
  if (fetching) {
    return (
      <Layout>
        <div>Loading ..</div>
      </Layout>
    );
  }
  if (!data?.post) {
    return (
      <Layout>
        <Box> Could not find a post</Box>
      </Layout>
    );
  }
  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: data.post?.title, text: data?.post?.text }}
        onSubmit={async (values) => {
          await updatePost({
            id: intId,
            ...values,
          });
          router.back();
        }}
      >
        {({ isSubmitting }) => (
          <Wrapper variant="small">
            <Form>
              <InputField name="title" placeholder="title" label="title" />
              <Box mt={4}>
                <InputField
                  textarea
                  name="text"
                  placeholder="text..."
                  label="body"
                />
              </Box>

              <Button
                mt={4}
                isLoading={isSubmitting}
                type="submit"
                variantColor="teal"
              >
                {" "}
                Updates Post{" "}
              </Button>
            </Form>
          </Wrapper>
        )}
      </Formik>
    </Layout>
  );
};
export default withUrqlClient(createUrqlClient)(EditPost);
