import React, {
  ReactElement,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import Tag from './Tag';
import Icon from '../Icon';
import { Category } from '@prisma/client';
import { getCategorys } from '../../lib/services';

type TTags = Pick<Category, 'name'>[];

interface Props {
  selectedTags: Category[] | undefined;
  onChange: (tags: Category[]) => void;
}

export default function CategoryPanel({
  selectedTags = [],
  onChange,
}: Props): ReactElement {
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState<TTags>([]);
  const [inputVisible, setInputVisible] = useState(false);

  const reload = useCallback(() => {
    getCategorys().then((res) => {
      setTags(res.data);
    });
  }, []);
  useEffect(() => {
    reload();
  }, [reload]);

  const handleChange = useCallback(
    (tag, checked) => {
      const nextSelectedTags = checked
        ? [...selectedTags, tag]
        : selectedTags.filter((t) => t.name !== tag.name);
      onChange(nextSelectedTags);
    },
    [selectedTags, onChange]
  );

  const handleInputConfirm = useCallback(async () => {
    if (inputValue && tags.findIndex((tag) => tag.name === inputValue) === -1) {
      setTags([...tags, { name: inputValue }]);
    }
    setInputValue('');
    setInputVisible(false);
  }, [inputValue, tags]);

  const handleInputKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputConfirm();
    }
  };

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-left text-skin-primary">
        标签
      </h2>
      <div className="text-skin-muted break-words">
        {tags.map((tag) => (
          <Tag
            key={tag.name}
            checked={selectedTags.findIndex((v) => v.name === tag.name) > -1}
            onChange={(checked) => handleChange(tag, checked)}
          >
            {tag.name}
          </Tag>
        ))}
      </div>

      {inputVisible && (
        <input
          ref={inputRef}
          type="text"
          className="tag-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleInputConfirm}
          onKeyDown={handleInputKeydown}
        />
      )}
      {!inputVisible && (
        <Tag
          className="bg-skin-primary  text-skin-inverted"
          onClick={() => setInputVisible(true)}
        >
          <Icon className="h-4 w-4 inline-block" type="plus" /> New Tag
        </Tag>
      )}
    </div>
  );
}
