"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect } from "react";
import { useMotionValue, Reorder, useDragControls, motion, animate, } from "motion/react";
import { GripVertical } from "lucide-react";
export function DragOrderList({ items, onReorder }) {
    const [list, setList] = React.useState(items);
    useEffect(() => {
        if (onReorder)
            onReorder(list);
    }, [list]);
    return (_jsx(Reorder.Group, { axis: "y", values: list, onReorder: setList, className: "space-y-4 w-full max-w-2xl mx-auto", children: list.map((item) => (_jsx(DragOrderItem, { item: item }, item.id))) }));
}
function DragOrderItem({ item }) {
    const y = useMotionValue(0);
    const boxShadow = useRaisedShadow(y);
    const dragControls = useDragControls();
    return (_jsxs(Reorder.Item, { value: item, style: { boxShadow, y }, dragListener: false, dragControls: dragControls, className: "flex justify-between items-start p-4 bg-background \r\n     text-foreground rounded-xl border border-border shadow-sm", children: [_jsxs("div", { className: "flex flex-col space-y-1 flex-1", children: [_jsx("h2", { className: "text-lg font-semibold", children: item.title }), _jsx("p", { className: "text-sm text-muted-foreground", children: item.subtitle }), _jsx("span", { className: "text-xs text-muted-foreground", children: item.date }), item.link && (_jsx("a", { href: item.link, target: "_blank", rel: "noopener noreferrer", className: "mt-2 inline-block text-xs text-blue-500 hover:underline", children: "More Info" }))] }), _jsx(ReorderHandle, { dragControls: dragControls })] }));
}
function ReorderHandle({ dragControls }) {
    return (_jsx(motion.div, { whileTap: { scale: 0.95 }, onPointerDown: (e) => {
            e.preventDefault();
            dragControls.start(e);
        }, className: "cursor-grab active:cursor-grabbing p-2 text-muted-foreground", children: _jsx(GripVertical, {}) }));
}
const inactiveShadow = "0px 0px 0px rgba(0,0,0,0.8)";
function useRaisedShadow(value) {
    const boxShadow = useMotionValue(inactiveShadow);
    useEffect(() => {
        let isActive = false;
        value.onChange((latest) => {
            const wasActive = isActive;
            if (latest !== 0) {
                isActive = true;
                if (isActive !== wasActive) {
                    animate(boxShadow, "5px 5px 15px rgba(0,0,0,0.15)");
                }
            }
            else {
                isActive = false;
                if (isActive !== wasActive) {
                    animate(boxShadow, inactiveShadow);
                }
            }
        });
    }, [value]);
    return boxShadow;
}
