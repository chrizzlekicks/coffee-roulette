require "test_helper"

class UserTest < ActiveSupport::TestCase
  test 'name validation' do
    user = User.new(:email => "test@test.com")

    assert_not user.valid?
    assert_raise ActiveRecord::RecordInvalid do
      user.save!
    end
  end

  test 'email validation' do
    user = User.new do |u|
      u[:name] = "test"
      u[:email] = "test"
    end

    assert_not user.valid?

    e = assert_raise ActiveRecord::RecordInvalid do
      user.save!
    end

    assert_equal 'Validation failed: Email Please provide valid email address', e.message
  end

  test "save user with correct name and email" do
    user = User.new do |u|
      u[:email] = "test@test.de"
      u[:name] = "test"
    end

    assert user.valid?
    assert user.save!
    assert_equal 1, User.all.count
  end
end
