import React from 'react';
import { View, Text } from 'react-native';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';

const CardGrid = ({ title, description, children, aside, actions }) => {
    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="text-xl font-bold mt-5">{title}</CardTitle>
                {description && (
                    <Text style={{ fontSize: 18 }} className="text-muted-foreground mt-0 font-medium">
                        {description}
                    </Text>
                )}
            </CardHeader>
            <CardContent className="gap-4">
                {children}
                {aside && <View>{aside}</View>}
            </CardContent>
            {actions && (
                <CardFooter className="justify-end border-t border-border pt-4">
                    {actions}
                </CardFooter>
            )}
        </Card>
    );
};

export default CardGrid;
