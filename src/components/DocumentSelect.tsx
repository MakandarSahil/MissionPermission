import React, { useState } from 'react';
import { Button } from 'react-native';
import { pick } from '@react-native-documents/picker';

const FileSelector = () => {
  return (
    <Button
      title="single file import"
      onPress={async () => {
        try {
          const [pickResult] = await pick();
          // const [pickResult] = await pick({mode:'import'}) // equivalent
          // do something with the picked file
        } catch (err: unknown) {
          // see error handling
        }
      }}
    />
  );
};

export default FileSelector;
