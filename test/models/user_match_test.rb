# frozen_string_literal: true

require 'test_helper'

class UserMatchTest < ActiveSupport::TestCase
  setup do
    @match = Match.create(date: DateTime.now)
    @user = User.create(email: 'test@test.de', username: 'test', password: 'random')
  end

  test 'match_id validation' do
    user_match = UserMatch.new(user: @user)

    assert_not user_match.valid?

    assert_raise ActiveRecord::RecordInvalid do
      user_match.save!
    end
  end

  test 'user_id validation' do
    user_match = UserMatch.new(match: @match)

    assert_not user_match.valid?

    assert_raise ActiveRecord::RecordInvalid do
      user_match.save!
    end
  end

  test 'create proper user_match' do
    user_match = UserMatch.new(match: @match, user: @user)

    assert user_match.valid?
    assert user_match.save!
    assert_equal 1, UserMatch.all.count
    assert_equal user_match.match.id, user_match.match_id
    assert_equal user_match.user.id, user_match.user_id
  end
end
