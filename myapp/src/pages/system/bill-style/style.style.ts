import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token }) => {
  return {
    previewSection: {
      marginTop: '20px',
      marginBottom: '20px',
      padding: '20px',
      border: `1px solid ${token.colorBorderSecondary}`,
      borderRadius: token.borderRadius,
      backgroundColor: token.colorBgContainer,
    },
    previewHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '20px',
    },
    previewCompany: {
      '& h2': {
        margin: 0,
        marginBottom: '8px',
        color: token.colorTextHeading,
      },
    },
    previewDate: {
      textAlign: 'right',
      '& p': {
        margin: 0,
        marginBottom: '8px',
        color: token.colorTextSecondary,
      },
    },
    previewAgent: {
      marginBottom: '20px',
      '& p': {
        margin: 0,
        color: token.colorText,
      },
    },
    previewOrderInfo: {
      '& h3': {
        margin: 0,
        marginBottom: '16px',
        color: token.colorTextHeading,
      },
    },
    previewTable: {
      width: '100%',
      borderCollapse: 'collapse',
      '& th, & td': {
        padding: '8px 12px',
        border: `1px solid ${token.colorBorderSecondary}`,
        textAlign: 'left',
      },
      '& th': {
        backgroundColor: token.colorBgLayout,
        fontWeight: 'bold',
      },
    },
    previewAmount: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '20px',
    },
    amountTable: {
      width: '300px',
    },
    amountRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
      '&:last-child': {
        borderBottom: 'none',
        fontWeight: 'bold',
      },
    },
    previewFooter: {
      marginTop: '40px',
      padding: '20px 0',
      borderTop: `1px solid ${token.colorBorderSecondary}`,
      textAlign: 'center',
      color: token.colorTextSecondary,
    },
    // 样式列表相关样式
    templateItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      cursor: 'pointer',
    },
    selectedTemplate: {
      backgroundColor: token.colorBgTextHover,
    },
    defaultTag: {
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: token.borderRadius,
      fontSize: '12px',
      backgroundColor: token.colorPrimary,
      color: token.colorWhite,
      marginLeft: '8px',
    },
  };
});

export default useStyles; 