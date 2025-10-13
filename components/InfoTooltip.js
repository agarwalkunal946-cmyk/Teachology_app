import React from 'react';
import { View } from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import { Info } from 'lucide-react-native';
import { theme } from '../styles/theme';

const InfoTooltip = ({ text }) => {
  const [toolTipVisible, setToolTipVisible] = React.useState(false);

  if (!text) return null;

  return (
    <Tooltip
      isVisible={toolTipVisible}
      content={<Text>{text}</Text>}
      placement="top"
      onClose={() => setToolTipVisible(false)}
      contentStyle={{ backgroundColor: theme.colors.textDark }}
      tooltipStyle={{ marginTop: 8 }}
      arrowStyle={{ borderTopColor: theme.colors.textDark }}
    >
      <TouchableOpacity onPress={() => setToolTipVisible(true)} style={{ marginLeft: 4 }}>
        <Info color={theme.colors.textLight} size={16} />
      </TouchableOpacity>
    </Tooltip>
  );
};

export default InfoTooltip;