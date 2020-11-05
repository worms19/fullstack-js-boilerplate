/* eslint-disable react/react-in-jsx-scope */
import { Box, Button, Flex, Heading, Link, Stack, Text } from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React, { useState } from "react";
import EditDeletePostButtons from "../components/EditDeletePostButtons";
import UpdootSection from "../components/UpdootSection";
import { useMeQuery, usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import Layout from "./Layout";

const Index = () => {
  const [{ data: meData }] = useMeQuery();
  const [variables, setVariables] = useState({
    limit: 20,
    cursor: null as null | string,
  });
  const [{ data, error, fetching }] = usePostsQuery({
    variables,
  });

  if (!fetching && !data) {
    return <div>failed request : {error?.message}</div>;
  }

  return (
    <>
      <Layout>
        <Stack spacing={8}>
          {fetching && !data ? (
            <div>loading</div>
          ) : (
            data!.posts.posts.map((p) =>
              !p ? null : (
                <Flex p={5} key={p.id} shadow="md" borderWidth="1px">
                  <UpdootSection post={p} />
                  <Box flex={1}>
                    <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                      <Link>
                        <Heading fontSize="xl">{p.title}</Heading>
                      </Link>
                    </NextLink>
                    <Text>posted By :{p.creator.username}</Text>
                    <Flex textAlign="center">
                      <Text mt={4}>{p.textSnippet}</Text>
                      {meData?.me?.id === p.creator.id ? (
                        <Box ml="auto">
                          <EditDeletePostButtons id={p.id} />
                        </Box>
                      ) : null}
                    </Flex>
                  </Box>
                </Flex>
              )
            )
          )}
        </Stack>
        {data && data.posts.hasMore && (
          <Flex>
            <Button
              onClick={() => {
                setVariables({
                  limit: variables.limit,
                  cursor:
                    data.posts.posts[data.posts.posts.length - 1].createdAt,
                });
              }}
              isLoading={fetching}
              m="auto"
              my={8}
            >
              {" "}
              Load More{" "}
            </Button>
          </Flex>
        )}
      </Layout>
    </>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
