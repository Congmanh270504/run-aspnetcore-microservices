"use client"
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SearchInput({ placeholder = 'Tìm kiếm...', className }: { placeholder?: string; className?: string }) {
    const searchParams = useSearchParams();
    const { replace } = useRouter();
    const pathname = usePathname();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('query', term);
        } else {
            params.delete('query');
        }
        params.set('page', '1');
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    return (
        <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
                placeholder={placeholder}
                onChange={e => handleSearch(e.target.value)}
                defaultValue={searchParams.get('query')?.toString()}
                aria-label={placeholder}
                className={cn("input-modern pl-10! h-10 w-full", className)}
            />
        </div>
    );
}
