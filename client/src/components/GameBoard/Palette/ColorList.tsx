import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { ChromePicker } from 'react-color';

const Container = styled.div`
  position: relative;
  padding: 1rem;
  border: 1px solid black;
`;

const Row = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;

  & + & {
    margin-top: 1rem;
  }
`;

const ColorItem = styled.div<{ colorHex: string; picker?: boolean }>`
  position: relative;
  width: calc((100% - 4rem) / 5);
  aspect-ratio: 1;

  border: ${({ picker }) => (picker ? '2px solid black' : '1px solid #aaaaaa')};
  background-color: ${({ colorHex }) => colorHex || 'black'};
  cursor: pointer;
`;

const ColorPicker = styled(ChromePicker)`
  position: absolute;
  top: calc(100% + 4px);
  right: 0px;
`;

interface ColorListProps {
  onClickItem: (colorHex: string) => void;
}

const ColorList = ({ onClickItem }: ColorListProps) => {
  const [pickerVisibility, setPickerVisibility] = useState<boolean>(false);
  const [pickedColor, setPickedColor] = useState<string>('#000000');
  const itemList = useMemo(
    () => [
      ['#000000', '#ff0000', '#ffff00', '#008000', '#0000ff'],
      ['#800080', '#00ff00', '#964b00', '#ffffff', 'picker']
    ],
    []
  );

  const handleColor = useCallback(
    (hexCode: string) => {
      setPickedColor(hexCode);
      onClickItem(hexCode);
    },
    [onClickItem]
  );

  useEffect(() => {
    const closeModal = (e: Event) => {
      if ((e.target as Element).closest('.picker')) {
        return null;
      }
      setPickerVisibility(false);
    };

    if (pickerVisibility) {
      document.addEventListener('click', closeModal);

      return () => {
        document.removeEventListener('click', closeModal);
      };
    }
  }, [pickerVisibility]);

  return (
    <Container>
      {itemList.map((row, idx) => (
        <Row key={idx}>
          {row.map((hexCode) => {
            if (hexCode === 'picker') {
              return (
                <ColorItem
                  key={'picker'}
                  colorHex={pickedColor}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPickerVisibility(true);
                  }}
                  picker
                >
                  {pickerVisibility && (
                    <ColorPicker
                      className='picker'
                      color={pickedColor}
                      onChange={(e) => handleColor(e.hex)}
                      disableAlpha={true}
                    />
                  )}
                </ColorItem>
              );
            } else {
              return (
                <ColorItem
                  key={hexCode}
                  colorHex={hexCode}
                  onClick={handleColor.bind(this, hexCode)}
                />
              );
            }
          })}
        </Row>
      ))}
    </Container>
  );
};

export default ColorList;
