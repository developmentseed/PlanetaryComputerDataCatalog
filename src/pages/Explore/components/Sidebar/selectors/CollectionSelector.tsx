import { DropdownMenuItemType, IDropdownOption } from "@fluentui/react";
import { sortBy } from "lodash-es";

import { useCollections } from "utils/requests";
import { IStacCollection } from "types/stac";
import StateSelector from "./StateSelector";
import { setCollection } from "../../../state/mosaicSlice";

import { collections as collectionConfig } from "config/datasets.yml";
import { useExploreSelector } from "pages/Explore/state/hooks";
import { useCollectionUrlState } from "./hooks/useUrlState";
import { isValidExplorer } from "utils/collections";

const CollectionSelector = () => {
  const { isSuccess, data } = useCollections();
  const collections: IStacCollection[] = data?.collections;
  const collection = useExploreSelector(state => state.mosaic.collection);

  // Sets selector values based off of url state
  useCollectionUrlState(collections);

  const collectionOptions = isSuccess ? sortedOptions(collections) : [];

  const getCollectionById = (key: string | number) => {
    return collections.find(c => c.id === key.toString());
  };

  return (
    <StateSelector
      title="Select a dataset to visualize"
      icon="World"
      action={setCollection}
      options={collectionOptions}
      // null will reset the control, while undefined will not
      selectedKey={collection?.id || null}
      getStateValFn={getCollectionById}
      disabled={!isSuccess}
      cyId="collection-selector"
    />
  );
};

export default CollectionSelector;

const depDataCategoryName = 'Digital Earth Pacific'

const sortedOptions = (collections: IStacCollection[]) => {
  const renderable = collections.filter(isValidExplorer)
  .filter(c => collectionConfig[c.id]?.hide !== true)
  .map(c => ({
    text: c.title,
    key: c.id,
    category: collectionConfig[c.id]?.category || "Other",
  }));
  const catCollections = sortBy(renderable, "text");
  const sortedCollections = sortBy(catCollections, "category");

  // put DEP data on the top
  const depPrioritizedCollections = [...sortedCollections.filter(e => e.category === depDataCategoryName), ...sortedCollections.filter( e => e.category !== depDataCategoryName)]
  const options: IDropdownOption[] = [];

  // Group by category, defined in the dataset config
  let lastCategory = "";
  depPrioritizedCollections.forEach(({ key, text, category }) => {
    // Add a category header if the category has changed
    if (lastCategory !== category) {
      options.push({
        key: `${category}-div`,
        text: "-",
        itemType: DropdownMenuItemType.Divider,
      });
      options.push({
        key: `${category}-header`,
        text: category,
        itemType: DropdownMenuItemType.Header,
      });
    }
    options.push({ key, text });
    lastCategory = category;
  });

  return options;
};
