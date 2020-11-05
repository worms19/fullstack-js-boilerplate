import { Box, IconButton, Link } from "@chakra-ui/core";
import React from "react";
import NextLink from "next/link";
import { useDeletePostMutation } from "../generated/graphql";

interface EditDeletePostButtonsProps {
  id: number;
}

const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
  id,
}) => {
  const [, deletePost] = useDeletePostMutation();

  return (
    <>
      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <IconButton mr={4} icon="edit" aria-label="Edit button" />
      </NextLink>
      <IconButton
        as={Link}
        icon="delete"
        aria-label="deletion button"
        variantColor="red"
        onClick={() => {
          deletePost({ id });
        }}
      />
    </>
  );
};
export default EditDeletePostButtons;
