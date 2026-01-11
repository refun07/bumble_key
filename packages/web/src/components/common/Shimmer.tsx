import React from 'react';

interface ShimmerProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    rounded?: string;
}

const Shimmer: React.FC<ShimmerProps> = ({
    className = '',
    width = '100%',
    height = '1rem',
    rounded = 'rounded-lg'
}) => {
    return (
        <div
            className={`animate-pulse bg-gray-200 ${rounded} ${className}`}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height
            }}
        />
    );
};

export const TableShimmer: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => {
    return (
        <div className="space-y-4 w-full">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-50">
                    {Array.from({ length: cols }).map((_, j) => (
                        <Shimmer key={j} className="flex-1" height={20} />
                    ))}
                </div>
            ))}
        </div>
    );
};

export const CardShimmer: React.FC = () => {
    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <Shimmer width={40} height={40} rounded="rounded-2xl" />
            </div>
            <Shimmer width="60%" height={16} />
            <Shimmer width="40%" height={24} />
        </div>
    );
};

export default Shimmer;
