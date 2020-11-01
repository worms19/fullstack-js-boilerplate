import { Box, Button, Flex, Link } from '@chakra-ui/core';
import React from 'react'
import NextLink from 'next/link'
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
    const [{fetching: logoutFetching}, logout] = useLogoutMutation()    
    const [{data, fetching}] = useMeQuery({
        pause: isServer(),
    })    
    let body = null;
    
    //data is loading
    if(fetching){
    
        //user isn' logged
    } else if( !data?.me) {
        body = (<>
         <NextLink href='/login'>
                        <Link  color="brown" mr={2}>Login</Link>    
                    </NextLink>
                    <NextLink href='/register'>
                        <Link color="brown" mr={2}>Register</Link>    
                    </NextLink>
        </>);
        //user is logged
    }else {
    body= 
        <Flex>
            <Box mr={2}>{data.me.username}</Box>
            <Button 
                variant="link"
                onClick={() =>{
                    logout()
                }}
                isLoading={logoutFetching}
                >
                    Logout
            </Button>
        </Flex>
    }
    return (
            <Flex bg="tomato" p={4} >
                <Box ml={"auto"}>
                   {body}
                </Box>
            </Flex>

        );
}