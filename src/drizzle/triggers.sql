CREATE TRIGGER cascade_bookmarks_after_list_delete
AFTER DELETE ON user_bookmark_list
FOR EACH ROW
BEGIN
  DELETE FROM user_bookmarks
  WHERE user_id = OLD.user_id AND list_name = OLD.list_name;
END;

