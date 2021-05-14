import Button from '@material-ui/core/Button';
import React from 'react';

interface IPFSFileListProps {
  cids: string[][]
}

export function IPFSFileList(props: IPFSFileListProps) {

  const { cids } = props;

  return (
    <div>
      {cids.map((roundCids: string[], round: number) => {
        return (
          <div key={round}>

            <h4>Round {round}</h4>

            {roundCids.map((cid: string, index: number) => {
              return (
                <Button
                  href={"https://ipfs.io/ipfs/" + cid}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="primary"
                  style={{ textTransform: 'none' }}
                  key={index}
                >
                  {"https://ipfs.io/ipfs/" + cid}
                </Button>
              )
            })}

          </div>
        )
      })}
    </div>
  )
}