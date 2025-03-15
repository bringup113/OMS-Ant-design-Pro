import React from 'react';

function computeHeight(node: HTMLDivElement) {
  const { style } = node;
  style.height = '100%';
  const totalHeight = parseInt(`${getComputedStyle(node).height}`, 10);
  const padding =
    parseInt(`${getComputedStyle(node).paddingTop}`, 10) +
    parseInt(`${getComputedStyle(node).paddingBottom}`, 10);
  return totalHeight - padding;
}

function getAutoHeight(n: HTMLDivElement) {
  if (!n) {
    return 0;
  }

  const node = n;

  let height = computeHeight(node);
  const parentNode = node.parentNode as HTMLDivElement;
  if (parentNode.tagName === 'BODY') {
    return height;
  }
  height = computeHeight(parentNode);
  return height;
}

type AutoHeightProps = {
  height?: number;
};

function autoHeight() {
  return <P extends AutoHeightProps>(
    WrappedComponent: React.ComponentClass<P> | React.FC<P>,
  ): React.FC<P> => {
    const AutoHeightComponent: React.FC<P> = (props) => {
      const [height, setHeight] = React.useState(0);
      const nodeRef = React.useRef<HTMLDivElement>(null);

      React.useEffect(() => {
        if (!nodeRef.current) {
          return;
        }
        let h = getAutoHeight(nodeRef.current);
        setHeight(h);
        const handleWindowResize = () => {
          if (!nodeRef.current) {
            return;
          }
          h = getAutoHeight(nodeRef.current);
          setHeight(h);
        };
        window.addEventListener('resize', handleWindowResize);
        return () => {
          window.removeEventListener('resize', handleWindowResize);
        };
      }, []);

      const propsWithHeight = {
        ...props,
        height,
      };
      return (
        <div ref={nodeRef} style={{ width: '100%' }}>
          <WrappedComponent {...propsWithHeight} />
        </div>
      );
    };

    return AutoHeightComponent;
  };
}

export default autoHeight; 