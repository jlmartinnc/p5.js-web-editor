import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import * as CollectionsActions from '../../IDE/actions/collections';
import * as SortingActions from '../../IDE/actions/sorting';
import { getCollection } from '../../IDE/selectors/collections';
import Loader from '../../App/components/loader';
import ArrowUpIcon from '../../../images/sort-arrow-up.svg';
import ArrowDownIcon from '../../../images/sort-arrow-down.svg';
import CollectionMetadata from './CollectionMetadata';
import dates from '../../../utils/formatDate';
import RemoveIcon from '../../../images/close.svg';

const CollectionItemRow = ({ item, isOwner, collection, user }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const formatDateCell = (date, mobile = false) =>
    dates.format(date, { showTime: !mobile });
  const handleSketchRemove = () => {
    dispatch(
      CollectionsActions.removeFromCollection(collection.id, item.projectId)
    );
  };

  const projectIsDeleted = item.isDeleted;
  const projectIsPrivate =
    !item.isDeleted && !isOwner && item.project?.visibility === 'Private';

  let name;
  if (projectIsDeleted) {
    name = <span>{t('Collection.SketchDeleted')}</span>;
  } else if (projectIsPrivate) {
    name = <span>Sketch is Private</span>;
  } else {
    name = (
      <Link to={`/${item.project.user.username}/sketches/${item.projectId}`}>
        {item.project.name}
      </Link>
    );
  }

  const sketchOwnerUsername =
    projectIsDeleted || projectIsPrivate ? null : item.project.user.username;

  return (
    <tr
      className={`sketches-table__row ${
        projectIsDeleted || projectIsPrivate ? 'is-deleted-or-private' : ''
      }`}
    >
      <th scope="row">{name}</th>
      <td>{formatDateCell(item.createdAt)}</td>
      <td>{sketchOwnerUsername}</td>
      <td className="collection-row__action-column">
        {isOwner && (
          <button
            className="collection-row__remove-button"
            onClick={handleSketchRemove}
            aria-label={t('Collection.SketchRemoveARIA')}
          >
            <RemoveIcon focusable="false" aria-hidden="true" />
          </button>
        )}
      </td>
    </tr>
  );
};

CollectionItemRow.propTypes = {
  collection: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  item: PropTypes.shape({
    createdAt: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    isDeleted: PropTypes.bool.isRequired,
    project: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      visibility: PropTypes.string,
      user: PropTypes.shape({
        username: PropTypes.string.isRequired
      })
    }).isRequired
  }).isRequired,
  isOwner: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
  }).isRequired
};

const Collection = ({ collectionId, username }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);
  const collection = useSelector((state) => getCollection(state, collectionId));
  const sorting = useSelector((state) => state.sorting);
  const loading = useSelector((state) => state.loading);

  useEffect(() => {
    dispatch(CollectionsActions.getCollections(username));
    dispatch(SortingActions.resetSorting());
  }, [dispatch, username]);

  const isOwner = () =>
    user != null &&
    typeof user.username !== 'undefined' &&
    collection?.owner?.username === user.username;

  const hasCollection = () => !!collection;
  const hasCollectionItems = () =>
    hasCollection() && collection.items.length > 0;

  const getTitle = () => {
    if (hasCollection()) {
      return `${t('Common.SiteName')} | ${collection.name}`;
    }
    if (username === user.username) {
      return t('Collection.Title');
    }
    return t('Collection.AnothersTitle', { anotheruser: username });
  };

  const renderLoader = () => (loading && !hasCollection() ? <Loader /> : null);

  const renderEmptyTable = () => {
    if (hasCollection() && !hasCollectionItems()) {
      return (
        <p className="collection-empty-message">{t('Collection.NoSketches')}</p>
      );
    }
    return null;
  };

  const getButtonLabel = (fieldName, displayName) => {
    const { field, direction } = sorting;
    if (field !== fieldName) {
      return field === 'name'
        ? t('Collection.ButtonLabelAscendingARIA', { displayName })
        : t('Collection.ButtonLabelDescendingARIA', { displayName });
    }
    return direction === SortingActions.DIRECTION.ASC
      ? t('Collection.ButtonLabelDescendingARIA', { displayName })
      : t('Collection.ButtonLabelAscendingARIA', { displayName });
  };

  const renderFieldHeader = (fieldName, displayName) => {
    const { field, direction } = sorting;
    const headerClass = classNames({
      arrowDown: true,
      'sketches-table__header--selected': field === fieldName
    });
    const buttonLabel = getButtonLabel(fieldName, displayName);
    return (
      <th scope="col">
        <button
          className="sketch-list__sort-button"
          onClick={() =>
            dispatch(SortingActions.toggleDirectionForField(fieldName))
          }
          aria-label={buttonLabel}
        >
          <span className={headerClass}>{displayName}</span>
          {field === fieldName &&
            (direction === SortingActions.DIRECTION.ASC ? (
              <ArrowUpIcon
                role="img"
                aria-label={t('Collection.DirectionAscendingARIA')}
              />
            ) : (
              <ArrowDownIcon
                role="img"
                IST
                aria-label={t('Collection.DirectionDescendingARIA')}
              />
            ))}
        </button>
      </th>
    );
  };

  return (
    <main
      className="collection-container"
      data-has-items={hasCollectionItems() ? 'true' : 'false'}
    >
      <article className="collection">
        <Helmet>
          <title>{getTitle()}</title>
        </Helmet>
        {renderLoader()}
        <CollectionMetadata collectionId={collectionId} />
        <article className="collection-content">
          <div className="collection-table-wrapper">
            {renderEmptyTable()}
            {hasCollectionItems() && (
              <table
                className="sketches-table"
                summary={t('Collection.TableSummary')}
              >
                <thead>
                  <tr>
                    {renderFieldHeader('name', t('Collection.HeaderName'))}
                    {renderFieldHeader(
                      'createdAt',
                      t('Collection.HeaderCreatedAt')
                    )}
                    {renderFieldHeader('user', t('Collection.HeaderUser'))}
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                  {collection.items.map((item) => (
                    <CollectionItemRow
                      key={item.id}
                      item={item}
                      user={user}
                      username={username}
                      collection={collection}
                      isOwner={isOwner()}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </article>
      </article>
    </main>
  );
};

Collection.propTypes = {
  collectionId: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired
};

export default Collection;
