import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token }) => {
  return {
    standardList: {
      '.ant-card-head': {
        borderBottom: 'none',
      },
      '.ant-card-head-title': {
        padding: '24px 0',
        lineHeight: '32px',
      },
      '.ant-card-extra': {
        padding: '24px 0',
      },
      '.ant-list-pagination': {
        marginTop: '24px',
      },
      '.ant-list-item-action': {
        marginLeft: '48px',
        padding: 0,
        lineHeight: '1.5',
      },
      '.ant-list-item-action-split': {
        display: 'none',
      },
      '.ant-list-item-meta-title': {
        marginBottom: '12px',
        fontSize: '0',
        '& > a': { color: token.colorTextHeading, fontSize: '16px', lineHeight: '24px' },
      },
      '.ant-list-item-meta-description': {
        color: token.colorTextSecondary,
      },
      '.ant-card-actions': {
        background: token.colorBgContainer,
      },
      extraContent: {
        float: 'right',
        marginTop: 16,
        marginRight: 0,
        textAlign: 'right',
      },
      extraContentSearch: {
        width: 240,
        marginLeft: 16,
      },
      tableList: {
        marginTop: 16,
      },
      tableListOperator: {
        margin: '16px 0',
      },
    },
    headerInfo: {
      position: 'relative',
      textAlign: 'center',
      '& > span': {
        display: 'inline-block',
        marginBottom: '4px',
        color: token.colorTextSecondary,
        fontSize: token.fontSize,
        lineHeight: '22px',
      },
      '& > p': {
        margin: 0,
        color: token.colorTextHeading,
        fontSize: '24px',
        lineHeight: '32px',
      },
      '& > em': {
        position: 'absolute',
        top: '0',
        right: '0',
        width: '1px',
        height: '56px',
        backgroundColor: token.colorSplit,
      },
    },
    listContent: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginLeft: '24px',
      '@media screen and (max-width: 768px)': {
        marginLeft: '0',
        '& > div:first-child': {
          top: '0',
        },
      },
      '@media screen and (max-width: 576px)': {
        display: 'block',
        marginLeft: '0',
        '& > div': {
          marginLeft: '0',
        },
      },
      '@media screen and (max-width: 480px)': {
        marginLeft: '0',
        '& > div': {
          marginLeft: '0',
        },
      },
      '@media screen and (max-width: 400px)': {
        textAlign: 'left',
        '& > div:last-child': {
          top: '0',
        },
      },
      '@media screen and (max-width: 1400px)': {
        textAlign: 'right',
        '& > div:last-child': {
          top: '0',
        },
      },
    },
    listContentItem: {
      display: 'inline-block',
      marginLeft: '40px',
      color: token.colorTextSecondary,
      fontSize: token.fontSize,
      verticalAlign: 'middle',
      '> span': { lineHeight: '20px' },
      '> p': { marginTop: '4px', marginBottom: '0', lineHeight: '22px' },
    },
    listCard: {
      [`@media screen and (max-width: ${token.screenXS}px)`]: {
        '.ant-card-head-title': {
          overflow: 'visible',
        },
      },
      [`@media screen and (max-width: ${token.screenMD}px)`]: {
        '.ant-radio-group': {
          display: 'block',
          marginBottom: '8px',
        },
      },
    },
    standardListForm: {
      '.ant-form-item': {
        marginBottom: '12px',
        '&:last-child': {
          marginBottom: '32px',
          paddingTop: '4px',
        },
      },
    },
    formResult: {
      width: '100%',
      "[class^='title']": { marginBottom: '8px' },
    },
  };
});

export default useStyles;