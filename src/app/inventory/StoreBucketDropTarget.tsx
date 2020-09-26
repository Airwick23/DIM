import { ThunkDispatchProp } from 'app/store/types';
import { itemCanBeEquippedByStoreId } from 'app/utils/item-utils';
import { DestinyClass } from 'bungie-api-ts/destiny2';
import clsx from 'clsx';
import React from 'react';
import {
  ConnectDropTarget,
  DropTarget,
  DropTargetConnector,
  DropTargetMonitor,
  DropTargetSpec,
} from 'react-dnd';
import { InventoryBucket } from './inventory-buckets';
import { DimItem } from './item-types';
import { dropItem } from './move-item';

interface ExternalProps extends ThunkDispatchProp {
  bucket: InventoryBucket;
  storeId: string;
  storeClassType: DestinyClass;
  equip?: boolean;
  children?: React.ReactNode;
  className?: string;
}

// These are all provided by the DropTarget HOC function
interface InternalProps {
  connectDropTarget: ConnectDropTarget;
  isOver: boolean;
  canDrop: boolean;
  item?: DimItem;
}

type Props = InternalProps & ExternalProps;

// This determines what types can be dropped on this target
function dragType(props: ExternalProps) {
  return [props.bucket.type!, `${props.storeId}-${props.bucket.type!}`];
}

// This determines the behavior of dropping on this target
const dropSpec: DropTargetSpec<Props> = {
  drop(props, monitor) {
    const item = monitor.getItem().item as DimItem;
    props.dispatch(dropItem(item, props.storeId, Boolean(props.equip)));
  },
  canDrop(props, monitor) {
    // You can drop anything that can be transferred into a non-equipped bucket
    if (!props.equip) {
      return true;
    }
    // But equipping has requirements
    const item = monitor.getItem().item as DimItem;
    return itemCanBeEquippedByStoreId(item, props.storeId, props.storeClassType);
  },
};

// This forwards drag and drop state into props on the component
function collect(connect: DropTargetConnector, monitor: DropTargetMonitor): InternalProps {
  const item = monitor.getItem();
  return {
    // Call this function inside render()
    // to let React DnD handle the drag events:
    connectDropTarget: connect.dropTarget(),
    // You can ask the monitor about the current drag state:
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
    item: item && (item.item as DimItem),
  };
}

class StoreBucketDropTarget extends React.Component<Props> {
  dragTimer?: number;

  render() {
    const { connectDropTarget, children, isOver, canDrop, equip, className, bucket } = this.props;

    // TODO: I don't like that we're managing the classes for sub-bucket here

    return connectDropTarget(
      <div
        className={clsx('sub-bucket', className, equip ? 'equipped' : 'unequipped', {
          'on-drag-hover': canDrop && isOver,
          'on-drag-enter': canDrop,
        })}
        onClick={this.onClick}
        aria-label={bucket.name}
      >
        {children}
      </div>
    );
  }

  private onClick = () => {
    document.body.classList.remove('drag-perf-show');
  };
}

export default DropTarget(dragType, dropSpec, collect)(StoreBucketDropTarget);
