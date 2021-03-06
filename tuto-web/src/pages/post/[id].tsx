import { Box, Heading } from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import React from "react";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";
import Layout from "../Layout";

const Post = ({}) => {
  const [{ data, error, fetching }] = useGetPostFromUrl();
  if (fetching) {
    return (
      <Layout>
        <div> Loading ...</div>
      </Layout>
    );
  }
  if (error) {
    return <div> {error.message}</div>;
  }
  if (!data?.post) {
    return (
      <Layout>
        <Box> Could not find a post</Box>
      </Layout>
    );
  }
  return (
    <Layout>
      <Heading mb={4}>{data?.post.title}</Heading>
      {data?.post?.text}
    </Layout>
  );
};
export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
