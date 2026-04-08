import React from 'react';

interface PageTitleProps {
    title: string;
    children?: React.ReactNode;
}

export function PageTitle({ title, children }: PageTitleProps) {
    if (children) {
        return (
            <div className="flex items-center justify-between pb-4 w-full">
                <h2 className="text-xl font-semibold">{title}</h2>
                <div>{children}</div>
            </div>
        );
    }
    return <h2 className="text-xl font-semibold pb-4 w-full">{title}</h2>;
}
