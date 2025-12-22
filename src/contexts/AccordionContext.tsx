import { createContext, useState, useCallback, useMemo } from "react";

interface AccordionContextType {
    isExpanded: (id: string) => boolean;
    toggle: (id: string) => void;
    expand: (id: string) => void;
    collapse: (id: string) => void;
    collapseAll: () => void;
};

export function useCreateAccordionContext(): AccordionContextType {

    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const isExpanded = useCallback((id: string) => expandedIds.has(id), [expandedIds]);

    const toggle = useCallback((id: string) => {

        setExpandedIds(prev => {

            const next = new Set(prev);

            if (next.has(id)) {

                next.delete(id);
            } else {

                next.add(id);
            }

            return next;
        });
    }, []);

    const expand = useCallback((id: string) => {

        setExpandedIds(prev => {

            if (prev.has(id)) return prev;
            const next = new Set(prev);
            next.add(id);

            return next;
        });
    }, []);

    const collapse = useCallback((id: string) => {

        setExpandedIds(prev => {

            if (!prev.has(id)) return prev;
            const next = new Set(prev);
            next.delete(id);

            return next;
        });
    }, []);

    const collapseAll = useCallback(() => {

        setExpandedIds(new Set());
    }, []);

    return useMemo(
        () => ({ isExpanded, toggle, expand, collapse, collapseAll }),
        [isExpanded, toggle, expand, collapse, collapseAll]
    );
}

const AccordionContext = createContext<AccordionContextType>({
    isExpanded: () => false,
    toggle: () => {},
    expand: () => {},
    collapse: () => {},
    collapseAll: () => {},
});

export default AccordionContext;
